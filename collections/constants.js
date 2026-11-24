window.COLLECTION = {
  // Đường dẫn tới trình đọc (tính từ thư mục collection)
  reader: "../reader/index.html",
  // Thêm tên tệp nằm cùng thư mục với index.html vào đây.
  // Có thể viết ngắn (chuỗi) hoặc đầy đủ (đối tượng):
  //   "ten-file.json.gz"
  //   { file: "ten-file.json.gz", title: "Tên hiển thị", updated: "2026-11-24" }
  // Tệp ở thư mục khác thì ghi đường dẫn: "data/ten-file.json.gz"
  files: [
    // "ten-file-1.json.gz",
    { file: "Nguyễn Khuyến.json.gz", title: "Nguyễn Khuyến" },
  ]
};