<?php

namespace App\Http\Controllers;

use DB;
use Cache;
use Session;
use App;
use File;
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

                if ($request->has('format') && $request->get('format')) {
                    return $this->downloadReport(studly_case($report_name), $report_data['columns'], $report_data['rows'], $request->get('format'));
                } else {
                    return $this->downloadReport(studly_case($report_name), $report_data['columns'], $report_data['rows']);
                }
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

    // download report in xls, xlsx, csv formats
    public function downloadReport($report_name, $columns, $rows, $format, $action = null)
    {
        if ($format) {
            if (!in_array($format, ['xls', 'xlsx', 'csv'])) {
                $format = 'xlsx';
            }
        } else {
            $format = 'xlsx';
        }

        // remove row property if not included in columns
        foreach($rows as $index => $row) {
            foreach ($row as $key => $value) {
                if (!in_array($key, $columns)) {
                    unset($rows[$index]->$key);
                }
            }
        }

        $filename = $report_name . "-" . date('Y-m-d H:i:s');
        $images_found = false;
        $export_data['sheets'][] = [
            'header' => $columns,
            'title' => $report_name,
            'rows' => $rows
        ];

        $report = Excel::create($filename, function($excel) use($export_data, $format, &$images_found) {
            foreach($export_data['sheets'] as $sheet_data) {
                $excel->sheet($sheet_data['title'], function($sheet) use($sheet_data, $format, &$images_found) {
                    $column_header = $sheet_data['header'];

                    foreach ($column_header as $key => $value) {
                        $column_header[$key] = awesome_case($column_header[$key]);

                        if (strpos($column_header[$key], 'Id') !== false) {
                            $column_header[$key] = str_replace("Id", "ID", $column_header[$key]);
                        }
                    }

                    $data = [];
                    $cell_counter = 2;
                    array_push($data, $column_header);

                    foreach($sheet_data['rows'] as $idx => $excel_row) {
                        $cell_no = 'A' . $cell_counter;

                        foreach ($excel_row as $key => $value) {
                            if (in_array($key, ['image', 'avatar']) && $value && $format != "csv") {
                                $images_found = true;
                                $im = imagecreatefromstring(file_get_contents(getImage($value, 100, 100, 95, 0, 'b')));
                                $img_path = public_path('/uploads/excel-download-img-' . $idx . '.jpg');

                                if ($im !== false) {
                                    header('Content-Type: image/jpeg');
                                    imagejpeg($im, $img_path);
                                    imagedestroy($im);

                                    $objDrawing = new \PHPExcel_Worksheet_Drawing;
                                    $objDrawing->setPath($img_path);
                                    $objDrawing->setCoordinates($cell_no);
                                    $objDrawing->setWorksheet($sheet);

                                    $sheet->setWidth('A', 10.8);
                                    $sheet->setSize(array(
                                        $cell_no => array(
                                            'width'     => 10.8,
                                            'height'    => 76
                                        )
                                    ));
                                }

                                $excel_row->$key = '';
                            }
                        }

                        array_push($data, (array) $excel_row);
                        $cell_counter++;
                    }

                    $sheet->fromArray($data, null, 'A1', false, false);
                    $sheet->freezeFirstRow();
                });
            }
        });

        if ($action && $action == "store") {
            return $report->store($format, false, true);
        } else {
            if ($images_found) {
                $report = $report->store($format, false, true);
                File::delete(File::glob(public_path('/uploads/excel-download-img-*')));
                return response()->download($report['full'])->deleteFileAfterSend(true);
            } else {
                $report->download($format);
            }
        }
    }
}
