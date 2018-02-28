<?php

namespace App;

use Krossroad\UnionPaginator\UnionPaginatorTrait;
use Illuminate\Database\Eloquent\Model;

class Activity extends Model
{
    use UnionPaginatorTrait;

    protected $table = 'oc_activity';

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'user_id', 'user', 'status', 'module', 'icon', 'action', 'form_id', 
        'form_title', 'owner', 'last_updated_by'
    ];
}
