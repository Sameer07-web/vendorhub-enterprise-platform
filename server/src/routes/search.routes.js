const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ApiResponse = require("../utils/ApiResponse");
const searchService = require("../services/search.service");
const { protect } = require("../middleware/auth.middleware");

router.get(
  "/",
  protect,
  catchAsync(async (req, res) => {
    const results = await searchService.globalSearch(req.query.q);
    res.status(200).json(
      new ApiResponse(200, "Search results retrieved", results)
    );
  })
);

module.exports = router;
