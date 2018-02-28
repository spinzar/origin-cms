<?php

namespace App\Http\Controllers;

use DB;
use Cache;
use Session;
use App;
use App\Http\Controllers\CommonController;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class ReportController extends Controller
{
    use CommonController;

    // Show list of all reports for the app
    public function show()
    {
        if (in_array(auth()->user()->role, ["System Administrator", "Administrator"])) {
            $app_reports = config('reports');
            return view('layouts.origin.reports')->with(['data' => $app_reports]);
        } else {
            return back()->withInput()->with(['msg' => 'You are not authorized to view "Reports"']);
        }
    }

    public function showReport(Request $request, $report_name)
    {
        $user_role = auth()->user()->role;

        if (in_array($user_role, ["System Administrator", "Administrator"])) {
            if (isset(config('reports')[studly_case($report_name)])) {
                $report_config = config('reports')[studly_case($report_name)];
            } else {
                Session::flash('success', false);
                return redirect()->route('home')->with('msg', 'No such report found');
            }

            if (isset($report_config['allowed_roles']) && !in_array($user_role, $report_config['allowed_roles'])) {
                return redirect()->route('home')->with('msg', 'You are not authorized to view "' . awesome_case($report_name) . '"');
            }

            if ($request->has('download') && $request->get('download') == 'Yes') {
                $report_data = $this->getData($request, $report_name, true);
                return $this->downloadReport(studly_case($report_name), $report_data['columns'], $report_data['rows']);
            } else {
                if ($request->ajax()) {
                    $report_data = $this->getData($request, $report_name);

                    if (isset($report_data['module']) && $report_data['module']) {
                        $report_data['module_slug'] = $this->getModuleSlug($report_data['module']);
                    }

                    return $report_data;
                } else {
                    return view('templates.report_view', [
                        'title' => awesome_case($report_name),
                        'file' => 'layouts.reports.' . $report_name
                    ]);
                }
            }
        } else {
            return redirect()->route('home')->with('msg', 'You are not authorized to view "Reports"');
        }
    }

    public function getData($request, $report_name, $download = false)
    {
        $report_controller = App::make("App\\Http\\Controllers\\Reports\\" . studly_case($report_name));

        if ($request->has('per_page') && $request->get('per_page')) {
            $per_page = (int) $request->get('per_page');
        } else {
            $per_page = 50;
        }

        return $report_controller->getData($request, $per_page, $download);
    }

    // make downloadable xls file for report
    public function downloadReport($report_name, $columns, $rows, $suffix = null, $action = null, $custom_rows = null)
    {
        // file name for download
        if ($suffix) {
            $filename = $report_name . "-" . date('Y-m-d H:i:s') . "-" . $suffix;
        } else {
            $filename = $report_name . "-" . date('Y-m-d H:i:s');
        }

        // remove row property if not included in columns
        foreach($rows as $index => $row) {
            foreach ($row as $key => $value) {
                if (!in_array($key, $columns)) {
                    unset($rows[$index]->$key);
                }
            }
        }

        $data_to_export['sheets'][] = [
            'header' => $columns,
            'sheet_title' => $report_name,
            'details' => $rows
        ];

        $report = Excel::create($filename, function($excel) use($data_to_export, $custom_rows) {
            foreach($data_to_export['sheets'] as $data_sheet) {
                $excel->sheet($data_sheet['sheet_title'], function($sheet) use($data_sheet, $custom_rows) {
                    $column_header = $data_sheet['header'];

                    foreach ($column_header as $key => $value) {
                        $column_header[$key] = awesome_case($column_header[$key]);

                        if (strpos($column_header[$key], 'Id') !== false) {
                            $column_header[$key] = str_replace("Id", "ID", $column_header[$key]);
                        }
                    }

                    $data = [];
                    array_push($data, $column_header);

                    foreach($data_sheet['details'] as $excel_row) {
                        array_push($data, (array) $excel_row);
                    }

                    // Add custom rows to file
                    if ($custom_rows) {
                        if (isset($custom_rows['after_line']) && $custom_rows['after_line']) {
                            for ($i = 0; $i < $custom_rows['after_line']; $i++) { 
                                array_push($data, []);
                            }
                        }

                        if (isset($custom_rows['rows']) && $custom_rows['rows']) {
                            foreach ($custom_rows['rows'] as $key => $value) {
                                array_push($data, array($key, $value));
                            }
                        }
                    }

                    $sheet->fromArray($data, null, 'A1', false, false);
                });
            }
        });

        if ($action) {
            if ($action == "store") {
                return $report->store('xls', false, true);
            } else {
                $report->download('xls');
            }
        } else {
            $report->download('xls');
        }
    }
}
