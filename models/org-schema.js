var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var orgIFS = {
  _id: {
    type: String,
    lowercase: true,
    trim: true
  },
  company_id: {
    type: String,
    lowercase: true,
    trim: true
  },
  org_code: {
    type: String,
    trim: true
  },
  org_name: {
    type: String,
    trim: true
  },
  org_entity: {
    type: String,
    lowercase: true,
    trim: true
  },
  leader: {
    type: String,
    lowercase: true,
    trim: true
  },
  sup_emp_no: {
    type: String,
    trim: true
  },
  org_term_type: {
    type: String,
    trim: true
  },
  org_level: {
    type: String,
    trim: true
  },
  sup_org_code: {
    type: String,
    trim: true
  },
  dept_name: {
    type: String,
    trim: true
  },
  unit_org_code: {
    type: String,
    trim: true
  },
  unit_name: {
    type: String,
    trim: true
  }
};

/**
 * the embedded documents do not need a _id
 * @type {Schema}
 */
var org = new Schema(orgIFS, { _id: false });

module.exports = {
  orgSchema: org
};
