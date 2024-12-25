const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const { nanoid } = require("nanoid");

const PORT = 3001;

app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://kandukuribalavikash20csd:balavikash@cluster0.ev0qb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("Error in connecting to DB:", err));

const urlSchema = mongoose.Schema({
  originalUrl: {
    type: String,
    required: true
  },
  shortUrl: {
    type: String,
    required: true
  },
  clicks: {
    type: Number,
    default: 0
  }
});

const Url = mongoose.model("Url", urlSchema);

app.post("/api/short", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({ message: "Original URL is required" });
    }

    const shortUrl = nanoid(8);

    const url = new Url({ originalUrl, shortUrl });
    await url.save();

    res.status(200).json({ message: "URL Generated", url: { shortUrl, originalUrl } });
  } catch (err) {
    console.error("Error in POST /api/short:", err);
    res.status(500).json({ message: "Error in generating URL", error: err.message });
  }
});

app.get("/:shortUrl", async (req, res) => {
  try {
    const { shortUrl } = req.params;

    const url = await Url.findOne({ shortUrl });

    if (!url) {
      return res.status(404).json({ message: "URL not found" });
    }

    url.clicks += 1;
    await url.save();

    res.redirect(url.originalUrl);
  } catch (err) {
    console.error("Error in GET /:shortUrl:", err);
    res.status(500).json({ message: "Error in redirecting to the original URL", error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
