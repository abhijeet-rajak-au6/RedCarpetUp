const moment = require("moment");
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter(offset) {
    let queryString = { ...this.queryString };

    Object.keys(queryString).map((qs) => {
      let gteDate = moment(queryString[qs].gte, "DD/MM/YYYY").utcOffset(
        offset * -1 || "+5:30"
      );
      let lteDate = moment(queryString[qs].lte, "DD/MM/YYYY").utcOffset(
        offset * -1 || "+5:30"
      );

      if (queryString[qs].lte) {
        queryString[qs].lte = lteDate;
      }
      if (queryString[qs].gte) {
        queryString[qs].gte = gteDate;
      }
    });
    let excludedFields = ["sort", "page", "limit", "fields"];

    excludedFields.forEach((el) => delete queryString[el]);
    let queryStr = JSON.stringify(queryString).replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`
    );

    this.query = this.query.find(JSON.parse(queryStr));
    // this.query.then((res) => console.log("res", res));

    return this;
  }
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-_id");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select({
        name: 1,
        email: 1,
      });
    }

    return this;
  }
  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
  populate(popFields) {
    this.query = this.query.populate(popFields);
    return this;
  }
}

module.exports = APIFeatures;
