<?php

namespace App\Http\Controllers;

use DB;
use Exception;
use App\Activity;
use App\Http\Controllers\CommonController;
use App\Http\Controllers\PermController;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class ActivityController extends Controller
{
    use CommonController;
    use PermController;

    public function show(Request $request)
    {
        if ($request->ajax()) {
            $fetch_fields = [
                'id', 'user_id', 'user', 'module', 'icon', 'action', 
                'form_id', 'form_title', 'created_at'
            ];

            $activities = Activity::select($fetch_fields);

            if (auth()->user()->role != 'System Administrator') {
                $modules = $this->getRoleModules();
                $module_ids_map = $this->getAllowedModuleRecordIds($modules);

                if ($module_ids_map && count($module_ids_map)) {
                    $activities = $activities->where('module', 'Auth')
                        ->whereIn('user_id', $module_ids_map['User']);

                    foreach ($module_ids_map as $module => $ids) {
                        if ($ids && count($ids)) {
                            $conditions = Activity::select($fetch_fields)
                                ->where('module', $module)
                                ->whereIn('form_id', $ids);

                            $activities = $activities->union($conditions);
                        }
                    }
                }
            }

            $activities = $activities->orderBy('created_at', 'desc')
                ->unionPaginate(20, $fetch_fields, $pageName = 'page', $request->get('page'));

            $current_user = auth()->user();
            return response()->json(compact('activities', 'current_user'), 200);
        } else {
            return view('layouts.origin.activities');
        }
    }

    // get module name and table of a role
    public function getRoleModules($role = null)
    {
        $modules = $this->getAppModules();
        $role = $role ? $role : auth()->user()->role;
        $role_modules = $this->roleWiseModules($role, "Read");
        $app_modules = [];

        if ($role_modules) {
            foreach ($modules as $module_name => $config) {
                if (in_array($module_name, $role_modules)) {
                    $app_modules[$module_name] = $config['table_name'];
                }
            }
        }

        return $app_modules;
    }

    // get all readable record ids of module
    public function getAllowedModuleRecordIds($modules)
    {
        $allowed_records = [];
        $error_msg = '';

        foreach ($modules as $module_name => $table_name) {
            try {
                $form_ids = DB::table($table_name);
                $perm_fields = $this->moduleWisePermissions(auth()->user()->role, 'Read', $module_name);

                if ($perm_fields) {
                    foreach ($perm_fields as $field_name => $field_value) {
                        if (is_array($field_value)) {
                            $form_ids = $form_ids->whereIn($field_name, $field_value);
                        } else {
                            $form_ids = $form_ids->where($field_name, $field_value);
                        }
                    }
                }

                $form_ids = $form_ids->pluck('id');

                if (is_array($form_ids) || is_object($form_ids)) {
                    $form_ids = json_decode(json_encode($form_ids), true);
                }

                $allowed_records[$module_name] = $form_ids;
            }
            catch (Exception $e) {
                $error_msg .= $e->getMessage();
                continue;
            }
        }

        return $allowed_records;
    }
}
