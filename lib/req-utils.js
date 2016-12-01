var moment = require('moment');

/**
 * adjust the month in the object to based on 0
 * @param  {Object} d date with month based on 1
 * @return {Object}   date with month based on 0
 */
function adjustMonth(d) {
  return {
    year: d.year,
    month: d.month - 1,
    day: d.day
  }
}

/**
 * validate the left and right dates, and left is before right
 * @param  {Request}   req  express request
 * @param  {Response}   res  express response
 * @param  {Function} next
 */
function validateDate(req, res, next) {
  var left = {
    year: Number(req.params.ly),
    month: Number(req.params.lm),
    day: Number(req.params.ld)
  }

  var right = {
    year: Number(req.params.ry),
    month: Number(req.params.rm),
    day: Number(req.params.rd)
  }

  var lMoment = moment(adjustMonth(left));
  var rMoment = moment(adjustMonth(right));

  if (!lMoment.isValid()) {
    return res.status(400).send('left side date is not valid');
  }

  if (!rMoment.isValid()) {
    return res.status(400).send('right side date is not valid');
  }

  if (lMoment.isSame(rMoment, 'day')) {
    return res.status(200).send('left and right are the same');
  }

  if (lMoment.isAfter(rMoment)) {
    return res.status(400).send('right side date must be after left side date');
  }
  req.left = left;
  req.right = right;
  next();
}

module.exports = {
  validateDate: validateDate
};
