<?php

namespace App\Http\Controllers;

use DB;
use App;
use Cache;
use Exception;
use App\Http\Controllers\CommonController;
use App\Http\Controllers\PermController;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class ListViewController extends Controller
{
    use CommonController;
    use PermController;

    public $module;

    public function showList(Request $request, $slug)
    {
        try {
            $this->module = $this->setModule($slug);
        } catch(Exception $e) {
            return back()->with(['msg' => $e->getMessage()]);
        }

        if ($slug == "report") {
            return redirect()->route('show.app.reports');
        } else {
            $user_role = auth()->user()->role;

            if ($user_role != 'System Administrator') {
                $allowed = $this->roleWiseModules($user_role, "Read", $this->module["name"]);

                if (!$allowed) {
                    $msg = 'You are not authorized to view "'. $this->module["display_name"] . '" records';

                    if (url()->current() === url()->previous()) {
                        return redirect()->route('home')->with('msg', $msg);
                    } else {
                        return back()->with(['msg' => $msg]);
                    }
                }
            }

            return $this->showListView($request);
        }
    }

    public function getRecords($search_text = null, $search_field = null)
    {
        $table = $this->module['table_name'];
        $table_columns = array_map('trim', explode(",", $this->module['list_view_columns']));
        $sort_field = $this->module['sort_field'];
        $sort_order = $this->module['sort_order'];
        $perm_fields = [];

        if (!in_array("id", $table_columns)) {
            array_push($table_columns, "id");
        }

        $record_query = DB::table($table)->select($table_columns);

        if (auth()->user()->role != 'System Administrator') {
            $perm_fields = $this->moduleWisePermissions(auth()->user()->role, 'Read', $this->module['name']);

            if ($perm_fields) {
                foreach ($perm_fields as $field_name => $field_value) {
                    if (is_array($field_value)) {
                        $record_query = $record_query->whereIn($field_name, $field_value);
                    } else {
                        $record_query = $record_query->where($field_name, $field_value);
                    }
                }
            }
        }

        // ajax search in list view
        if ($search_text) {
            $search_in = $this->module['search_field'];
            $search_field = $search_field ? $search_field : $search_in;

            return DB::table($table)->select($table_columns)
                ->where($search_field, $search_text)
                ->orderBy($sort_field, $sort_order)
                ->get();
        } else {
            $records_per_page = $this->getAppSetting('list_view_records');
            return $record_query->orderBy($sort_field, $sort_order)->paginate((int) $records_per_page);
        }
    }

    public function showListView($request)
    {
        $table_name = $this->module['table_name'];
        $columns = array_map('trim', explode(",", $this->module['list_view_columns']));
        $form_title = $this->module['form_title'];

        if ($request->ajax()) {
            if ($request->has('search') && $request->get('search')) {
                // prepare rows based on search criteria
                return $this->prepareListViewData($request->get('search'), $request->get('search_field'));
            } elseif ($request->has('delete_list') && !empty($request->get('delete_list'))) {
                // delete the selected rows from the list view
                return $this->deleteSelectedRecords($request, $request->get('delete_list'));
            } else {
                // return list of all rows for refresh list
                return $this->prepareListViewData();
            }
        }
        else {
            try {
                $list_view_data = $this->prepareListViewData();
            } catch(Exception $e) {
                return redirect()->route('home')->with('msg', $e->getMessage());
            }

            return view('templates.list_view', $list_view_data);
        }
    }


    // prepare list view data
    public function prepareListViewData($search_text = null, $search_field = null)
    {
        try {
            $rows = $this->getRecords($search_text, $search_field);
        } catch(Exception $e) {
            throw new Exception('"' . $this->module["table_name"] . '" table not found in database');
        }

        $list_view_data = [
            'module' => $this->module['name'],
            'rows' => $rows,
            'columns' => array_map('trim', explode(",", $this->module['list_view_columns'])),
            'form_title' => $this->module['form_title'],
            'title' => $this->module['display_name'],
            'module' => $this->module['name'],
            'slug' => $this->module['slug'],
            'link_field' => $this->module['link_field'],
            'search_via' => $this->module['search_field'],
            'count' => count($rows)
        ];

        return $list_view_data;
    }


    // filter list view data based on filter value
    public function deleteSelectedRecords($request, $delete_records)
    {
        $delete_ids = [];

        foreach ($delete_records as $url) {
            $id = last(explode("/", $url));

            if (!in_array($id, $delete_ids)) {
                array_push($delete_ids, $id);
            }
        }

        $origin_controller = App::make("App\\Http\\Controllers\\OriginController");

        foreach ($delete_ids as $id) {
            $origin_controller->delete($request, $this->module['slug'], $id);
        }

        return $delete_ids;
    }
}
