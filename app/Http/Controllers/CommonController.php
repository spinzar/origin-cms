<?php

namespace App\Http\Controllers;

use App;
use DB;
use Session;
use Exception;
use Cache;
use File;
use Mail;
use App\Module;
use App\Activity;

trait CommonController
{
    // save new activity data
    public function saveActivity($activity_data)
    {
        if (auth()->user()->login_id || $activity_data['login_id']) {
            if ($activity_data['module'] == "Auth") {
                $activity_data['owner'] = $activity_data['last_updated_by'] = $activity_data['login_id'];
            } else {
                $activity_data['owner'] = $activity_data['last_updated_by'] = auth()->user()->login_id;
            }

            unset($activity_data['login_id']);

            $activity_data['created_at'] = $activity_data['updated_at'] = date('Y-m-d H:i:s');
            Activity::insert($activity_data);
        }
    }

    // get table slug from module
    public function getModuleSlug($module)
    {
        $app_modules = $this->getAppModules();

        if (isset($app_modules[$module]) && $app_modules[$module]) {
            if (isset($app_modules[$module]['slug']) && $app_modules[$module]['slug']) {
                return $app_modules[$module]['slug'];
            }
        }

        return false;
    }

    // get table name from module
    public function getModuleTable($module)
    {
        $module_config = $this->getAppModules();
        return $module_config[$module]['table_name'];
    }

    // check is referer is list view
    public function checkListView($request)
    {
        $base_url = url('/') . "/";
        $referer = $request->server('HTTP_REFERER');
        $request_path = str_replace($base_url, "", $referer);
        $request_path = explode("/", $request_path);

        if (isset($request_path[0]) && $request_path[0] === "list") {
            return true;
        }

        return false;
    }

    // check is referer is report view
    public function checkReportView($request)
    {
        $base_url = url('/') . "/";
        $referer = $request->server('HTTP_REFERER');
        $request_path = str_replace($base_url, "", $referer);
        $request_path = explode("/", $request_path);

        if (isset($request_path[1]) && $request_path[1] === "report") {
            return true;
        }

        return false;
    }

    // create user specific app settings
    public function createUserSettings($login_id)
    {
        $settings = array(
            ['field_name' => 'home_page', 'field_value' => 'modules', 'module' => 'Other', 'owner' => $login_id, 'last_updated_by' => $login_id, 'created_at' => date("Y-m-d H:i:s"), "updated_at" => date("Y-m-d H:i:s")],
            ['field_name' => 'list_view_records', 'field_value' => '15', 'module' => 'Other', 'owner' => $login_id, 'last_updated_by' => $login_id, 'created_at' => date("Y-m-d H:i:s"), "updated_at" => date("Y-m-d H:i:s")]
        );

        DB::table('oc_settings')->insert($settings);
    }

    // Modules config such as icon, color, etc
    public function getAppModules()
    {
        if (Cache::has('app_modules') && Cache::get('app_modules'))
        {
            $app_modules = Cache::get('app_modules');
        } else {
            $app_modules = Cache::rememberForever('app_modules', function() {
                $fields = [
                    'name', 'display_name', 'controller_name', 'slug', 'icon', 'icon_color', 
                    'bg_color', 'table_name', 'form_title', 'list_view_columns', 'image_field', 
                    'sort_field', 'sort_order'
                ];

                $module_defaults = Module::select($fields)
                    ->where('is_active', '1')
                    ->where('show', '1')
                    ->where('is_child_table', '0')
                    ->orderBy('sequence_no', 'asc')
                    ->get();

                foreach ($module_defaults as $idx => $module) {
                    $app_modules[$module->name] = [];

                    foreach ($fields as $idx => $field) {
                        $app_modules[$module->name][$field] = $module->$field;
                    }

                    $app_modules[$module->name]['link_field'] = 'id';
                    $app_modules[$module->name]['link_field_label'] = 'ID';
                    $app_modules[$module->name]['view'] = 'layouts.modules.' . $module->slug;
                    $app_modules[$module->name]['upload_folder'] = '/uploads/' . $module->slug;
                }

                return $app_modules;
            });
        }

        return (array) $app_modules;
    }

    public function setModule($slug)
    {
        $module_data = '';
        $app_modules = $this->getAppModules();

        foreach ($app_modules as $module) {
            if ($module['slug'] == $slug) {
                $module_data = $module;
                break;
            }
        }

        if ($module_data) {
            if (File::exists(app_path('Http/Controllers/' . $module_data["controller_name"] . '.php'))) {
                $controller_file = App::make("App\\Http\\Controllers\\" . $module_data["controller_name"]);

                if ($controller_file) {
                    if (property_exists($controller_file, 'module_config')) {
                        $module_config = $controller_file->module_config;

                        if ($module_config && count($module_config)) {
                            foreach ($module_config as $key => $value) {
                                $module_data[$key] = $value;
                            }
                        }
                    }
                }
            }
        }
        else {
            throw new Exception("No Module found for slug: '" . $slug . "'");
        }

        return $module_data;
    }

    // get app setting value
    public function getAppSetting($name = null)
    {
        if ($name) {
            return Session::get('app_settings')[$name];
        } else {
            return Session::get('app_settings');
        }
    }

    public function putAppSettingsInSession()
    {
        $user_login_id = auth()->user()->login_id;

        $settings = DB::table('oc_settings')
            ->select('field_name', 'field_value', 'owner');

        if (!in_array(auth()->user()->role, ['System Administrator', 'Administrator'])) {
            $settings = $settings->whereIn('owner', [$user_login_id, 'admin']);
        } else {
            $settings = $settings->where('owner', $user_login_id);
        }

        $settings = $settings->get();

        $app_settings = [];

        foreach ($settings as $setting) {
            if ($setting->owner != $user_login_id) {
                if ($user_login_id == 'admin') {
                    if (!in_array($setting->field_name, ['email', 'sms'])) {
                        continue;
                    }
                }
            }

            $app_settings[$setting->field_name] = $setting->field_value;
        }

        Session::put('app_settings', $app_settings);
        return true;
    }

    // returns table column name and column type
    public function getTableSchema($table, $get_nullable = false)
    {
        $columns = DB::connection()
            ->getDoctrineSchemaManager()
            ->listTableColumns($table);

        $table_schema = [];

        foreach($columns as $column) {
            if ($get_nullable) {
                $table_schema[$column->getName()] = [
                    'datatype' => $column->getType()->getName(), 
                    'nullable' => !$column->getNotnull(),
                    // 'default' => $column->getDefault()
                ];
            } else {
                $table_schema[$column->getName()] = $column->getType()->getName();
            }
        }

        return $table_schema;
    }
}
