const htmlToPdf = require("html-pdf-node");
const fs = require("fs");

let options = { format: "A4" };

let file = { url: "http://localhost:8080" };
htmlToPdf.generatePdf(file, options).then((pdfBuffer) => {
  fs.writeFile("output.pdf", pdfBuffer, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log("PDF saved");
    }
  });
});
