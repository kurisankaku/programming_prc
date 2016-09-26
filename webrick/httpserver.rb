#!/usr/bin/env ruby
require "webrick"
include WEBrick

$docroot = File.join(Dir::pwd, "public_html")
s = HTTPServer.new(
 :Port => 8000
)
# コンテンツを置くディレクトリ
$docroot = File.expand_path(File.join(Dir::pwd, "public_html"))

# ファイルを読み込むproc
s.mount_proc("/") { |req, res|
  # パスからファイル名を生成
  filename = File.expand_path(File.join($docroot,*req.path.split("/")))
  # 指定されたURLがディレクトリならindex.htmlを追加
  if File.directory?(filename)
    filename = File.join(filename, "index.html")
  end
  res.body = open(filename).read
  # 拡張子とContent-Typeの対応表
  content_types = {
    "html" => "text/html", "txt" => "text/plain",
    "jpg" => "image/jpeg", "jpeg" => "image/jpeg",
    "gif" => "image/gif", "png" => "imge/png"
  }
  # filenameの拡張子を見てContent-Typeを設定
  content_type = content_types[File.extname(filename)]
  # Content-Typeが見つからなかったらtext/htmlを設定
  if content_type==nil
    content_type = "text/html"
  end
  res["Content-Type"] = content_type
}

trap("INT"){ s.shutdown }
s.start
