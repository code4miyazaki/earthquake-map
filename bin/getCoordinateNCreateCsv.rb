# encoding: utf-8
require 'open-uri'
require 'nokogiri'
require 'json'
require 'kconv'

STDOUT.flush

# 気象庁が公開している震源リストからEarthquakeJapanMapで使用するjsonを作成するスクリプト

# urlからhtmlを取得
def get_html(url, charset = nil)
  html = open(url) do |f|
    charset = f.charset if charset == nil
    f.read
  end
  return Nokogiri::HTML.parse(html, nil, charset)
end

# get_html()で取得したhtmlを変換しつつlist型で返す
def get_list(doc)
  doc_arr = doc.css("pre").text.strip.split("\n")
  list = []
  doc_arr.each_with_index do |coordinate, i|
    next if i == 0 || i == 1
    tmp_data = []
    while coordinate.include?("° ") do
      coordinate.gsub!("° ","°")
    end
    coordinate.split(" ").each do |tmp|
      tmp_data.push tmp unless tmp.nil?
    end
    arr = []
    tmp_data.each_with_index do |a, i|
      if i == 5 || i == 6
        arr.push dmm2deg(a)
      elsif i == 3
        arr.push "#{tmp_data[3]}:#{tmp_data[4].split(".")[0]}"
      elsif i == 4
      else 
        arr.push a
      end
    end
    list.push arr
  end
  return list
end

# get_html()で取得したhtmlからtitleのみを返す
def get_title(doc)
  arr = doc.css("pre").text.strip.split("\n")
  list = []
  arr.first.split(" ").each do |tmp|
    list.push tmp unless tmp.nil?
  end
  return list
end

# DMM形式の軽度・緯度をDEG方式(10進)に変換
def dmm2deg(str)
 tmp = str.split("°")
 d = tmp[0].to_i

 tmp = tmp[1].split(".")
 m = tmp[0].to_i

 tmp = tmp[1].split("'")
 s = tmp[0].to_i

 return d + (m * 60 + s) / 3600.to_f
end

# amChartsで使うためのパーセンテージ(0〜1)を追加
def add_percent(coordinates)
  time_min = convert_seconds(coordinates[0][3])
  time_max = convert_seconds(coordinates[-1][3])
  puts time_min
  puts time_max
  denominator = time_max - time_min
  coordinates.each_with_index do |crd, i|
    if crd.size == 0
      coordinates.delete_at i
      next
    end
    time = convert_seconds(crd[3]) - time_min
    crd.push (time / denominator.to_f)
  end
  return coordinates
end

# hh:mm:ssを秒に変換
def convert_seconds(str)
  times = str.split(":")
  return (times[0].to_i * 60 + times[1].to_i) * 60 + times[2].to_i
end


# json出力
# 範囲は2018/1/1〜今日まで
list = []
(Date.new(2018,1,1)..Date.today).each do |date|
  date_format = date.strftime("%Y%m%d")
  puts "date: #{date_format}"
  begin
    doc = get_html("https://www.data.jma.go.jp/svd/eqev/data/daily_map/#{date_format}.html")
    data = get_list(doc)
    File.open("#{__dir__}/../data/coordinate#{date_format}.json", "w") do |f|
      f.puts(JSON.generate(add_percent(data)))
    end
  rescue => exception
    p exception
  end
end
