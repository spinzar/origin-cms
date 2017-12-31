<?php

namespace App\Http\Controllers;

use DB;
use App;
use Cache;
use App\Http\Controllers\CommonController;
use App\Http\Controllers\PermController;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class AutocompleteController extends Controller
{
    use CommonController;
    use PermController;

    public function getData(Request $request)
    {
        $status_modules = ['User'];

        $module = $request->get('module');
        $module_table = $this->getModuleTable($module);
        $field = $request->get('field');
        $query = $request->get('query');

        if ($request->has('fetch_fields') && $request->get('fetch_fields')) {
            $fetch_fields = $request->get('fetch_fields');
        }

        $list_view = $this->checkListView($request);
        $report_view = $this->checkReportView($request);

        if ($list_view || $report_view) {
            $fetch_fields = [$field, 'id'];
        }
        else {
            $fetch_fields = (isset($fetch_fields)) ? $fetch_fields : $field;
        }

        $data_query = DB::table($module_table)
            ->select($fetch_fields)
            ->where($field, 'like', '%' . $query . '%');

        // permission fields from perm controller
        if (auth()->user()->role != 'System Administrator') {
            $perm_fields = $this->moduleWisePermissions(auth()->user()->role, 'Read', $module);

            if ($perm_fields) {
                foreach ($perm_fields as $field_name => $field_value) {
                    if (is_array($field_value)) {
                        $data_query = $data_query->whereIn($field_name, $field_value);
                    } else {
                        $data_query = $data_query->where($field_name, $field_value);
                    }
                }
            }
        }

        // only show active data for defined tables
        if (in_array($module, $status_modules) && !$list_view && !$report_view) {
            $data_query = $data_query->where('is_active', '1');
        }

        // show only unique rows for list view
        if ($list_view || $report_view) {
            $data_query = $data_query->groupBy($field)
                ->whereNotNull($field);
        }

        $data = $data_query->get();
        return $data;
    }
}
