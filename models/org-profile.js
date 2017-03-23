var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var org = new Schema({
  company_id: {
    type: String,
    lowercase: true,
    trim: true
  },
  org_code: {
    type: String,
    trim: true,
    index: true
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
});

var Org = mongoose.model('Org', org);

module.exports = {
  Org: Org
};
