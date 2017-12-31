<?php

namespace App\Http\Controllers;

use DB;
use Illuminate\Http\Request;

use App\Http\Requests;
use App\Http\Controllers\Controller;

class ActivityController extends Controller
{
    public function show()
    {
        if (in_array(auth()->user()->role, ["System Administrator", "Administrator"])) {
            $data = DB::table('oc_activity')
                ->orderBy('id', 'desc')
                ->paginate(20);

            return view('layouts.origin.activities')->with(['data' => $data]);
        } else {
            abort('403');
        }
    }
}
