<div class="box form-section" id="module-details">
    <div class="box-header">
        <h5 class="box-title">Module Details
            <div class="box-tools pull-right">
                <button type="button" class="btn btn-box-tool" data-widget="collapse">
                    <i class="fa fa-minus"></i>
                </button>
            </div>
        </h5>
    </div>
    <div class="box-body form-content">
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Name</label>
                    <div>
                        <input type="text" name="name" class="bg-focus form-control" data-mandatory="yes" autocomplete="off">
                        <small class="block">Should be without spaces and any special characters</small>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Is Active</label>
                    <div>
                        <select name="is_active" class="form-control" data-mandatory="yes">
                            <option value="1" default selected>Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Display Name</label>
                    <div>
                        <input type="text" name="display_name" class="form-control" data-mandatory="yes" autocomplete="off">
                        <small class="block">Visible to users as Module Name</small>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Table Name</label>
                    <div>
                        <input type="text" name="table_name" class="form-control" data-mandatory="yes" autocomplete="off">
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Controller Name</label>
                    <div>
                        <input type="text" name="controller_name" class="form-control" data-mandatory="no" autocomplete="off">
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Slug</label>
                    <div>
                        <input type="text" name="slug" class="form-control" data-mandatory="no" autocomplete="off">
                        <small class="block">Used as URL slug to show data in list & form view</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Create Migration</label>
                    <div>
                        <select name="create_migration" class="form-control" data-mandatory="yes">
                            <option value="1" default selected>Yes</option>
                            <option value="0">No</option>
                        </select>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">List View Columns</label>
                    <div>
                        <input type="text" name="list_view_columns" class="form-control" data-mandatory="no" autocomplete="off">
                        <small class="block">Separate multiple columns with comma(,)</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Show</label>
                    <div>
                        <select name="show" class="form-control" data-mandatory="yes">
                            <option value="1" default selected>Yes</option>
                            <option value="0">No</option>
                        </select>
                        <small class="block">Select 'Yes' to show this on Modules page</small>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Sequence No</label>
                    <div>
                        <input type="text" name="sequence_no" class="form-control" data-mandatory="no" autocomplete="off">
                        <small class="block">You can change this setting on Modules page</small>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="box form-section" id="module-customization-details">
    <div class="box-header">
        <h5 class="box-title">Customization
            <div class="box-tools pull-right">
                <button type="button" class="btn btn-box-tool" data-widget="collapse">
                    <i class="fa fa-minus"></i>
                </button>
            </div>
        </h5>
    </div>
    <div class="box-body form-content">
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Background color</label>
                    <div>
                        <input type="text" name="bg_color" class="form-control" data-mandatory="no" autocomplete="off">
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Icon</label>
                    <div>
                        <input type="text" name="icon" class="form-control" data-mandatory="no" autocomplete="off">
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Icon Color</label>
                    <div>
                        <input type="text" name="icon_color" class="form-control" data-mandatory="no" autocomplete="off">
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="box form-section" id="module-configuration-details">
    <div class="box-header">
        <h5 class="box-title">Configuration
            <div class="box-tools pull-right">
                <button type="button" class="btn btn-box-tool" data-widget="collapse">
                    <i class="fa fa-minus"></i>
                </button>
            </div>
        </h5>
    </div>
    <div class="box-body form-content">
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Form Title</label>
                    <div>
                        <input type="text" name="form_title" class="form-control" data-mandatory="no" autocomplete="off" val="id">
                        <small class="block">Select a column to be displayed as form title</small>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Search Field</label>
                    <div>
                        <input type="text" name="search_field" class="form-control" data-mandatory="no" autocomplete="off" val="id">
                        <small class="block">Select a column which activates for searching in list view</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Image Field</label>
                    <div>
                        <input type="text" name="image_field" class="form-control" data-mandatory="no" autocomplete="off">
                        <small class="block">Must be of field 'Image'</small>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Is Child Table</label>
                    <div>
                        <select name="is_child_table" class="form-control" data-mandatory="yes">
                            <option value="1">Yes</option>
                            <option value="0" default selected>No</option>
                        </select>
                        <small class="block">Child Table will be shown as Grid in form view</small>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Sort Field</label>
                    <div>
                        <input type="text" name="sort_field" class="form-control" data-mandatory="no" autocomplete="off" val="id">
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Sort Order</label>
                    <div>
                        <select name="sort_order" class="form-control" data-mandatory="yes">
                            <option value="desc" default selected>Descending</option>
                            <option value="asc">Ascending</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="form-group">
                    <label class="control-label">Description</label>
                    <div>
                        <textarea rows="5" name="description" class="form-control" data-mandatory="no" autocomplete="off"></textarea>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
