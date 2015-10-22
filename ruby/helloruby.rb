def kan2num(string)
	digit4 = digit3 = digit2 = digit1 = "0"

	nstring = string.dup
	nstring.gsub!(/一/, "1")
	nstring.gsub!(/二/, "2")
	nstring.gsub!(/三/, "3")
	nstring.gsub!(/四/, "4")
	nstring.gsub!(/五/, "5")
	nstring.gsub!(/六/, "6")
	nstring.gsub!(/七/, "7")
	nstring.gsub!(/八/, "8")
	nstring.gsub!(/九/, "9")
	
	if nstring =~ /((\d)?千)?((\d)?百)?((\d)?十)?(\d)?$/
		if $1
			digit4 = $2 || "1"
		end
		if $3
			digit3 = $4 || "1"
		end
		if $5
			digit2 = $6 || "1"
		end
		digit1 = $7 || "0"
	end

	return (digit4+digit3+digit2+digit1).to_i
end

def count_words(file_path)
	# 単語数のカウント
	count = Hash.new(0)

	## 単語の集計
	File.open(file_path) do |f|
		f.each_line do |line|
			words = line.split
			words.each do |word|
				count[word] += 1
			end
		end
	end
	return count
end

def str2hash(str)
	hash = Hash.new
	array = str.split(/\s+/)
	while key = array.shift
		value = array.shift
		hash[key] = value
	end
	return hash
end

def get_local_and_domain(str)
	str =~ /^([^@]+)@(.*)$/
	localpart = $1
	domain = $2
	return [localpart, domain]
end

def word_capitalize(str)
	return str.gsub(/[^-]+/) do |matched|
		matched.capitalize
	end
end

def wc(file)
	nline = nword = nchar = 0
	File.open(file) do |io|
		io.each do |line|
			words = line.split(/\s+/).reject{|w| w.empty?}
			nline += 1
			nword += words.length
			nchar += line.length
		end
	end
	puts "lines=#{nline} words=#{nword} chars=#{nchar}"
end

def reverse(input)
	open(input, "r+") do |f|
		lines = f.readlines
		f.rewind
		f.truncate(0)
		f.write lines.reverse.join()
	end
end

def tail(lines, file)
	queue = Array.new
	open(file) do |io|
		while line = io.gets
			queue.push(line)
			if queue.size > lines
				queue.shift
			end
		end
	end
	queue.each{|line| print line}
end

def traverse(path)
	if File.directory?(path)
		dir = Dir.open(path)
		while name = dir.read
			next if name == "."
			next if name == ".."
			traverse(path + "/" + name)
		end
		dir.close
	else
		process_file(path)
	end
end

def process_file(path)
	puts path
end

def print_libraries
	$:.each do |path|
		next unless FileTest.directory?(path)
		Dir.open(path) do |name|
			if name =~ /\.rb$/i
				puts name
			end
		end
	end
end

require "find"
def du(path)
	result = 0
	Find.find(path){|f|
		if File.file?(f)
			result += File.size(f)
		end
	}
	printf("%d %s\n", result, path)
end

def to_utf8(str_euc, str_sjis)
	str_euc.encode("UTF-8") + str_sjis.encode("UTF-8")
end

def jparsedate(str)
	now = Time.now
	year = now.year
	month = now.month
	day = now.day
	hour = now.hour
	min = now.min
	sec = now.sec
	str.scan(/(午前|午後)?(\d+)(年|月|日|時|分|秒)/) do
		case $3
		when "年"
			year = $2.to_i
		when "月"
			month = $2.to_i
		when "日"
			day = $2.to_i
		when "時"
			hour = $2.to_i
			hour += 12 if $1 == "午後"
		when "分"
			min = $2.to_i
		when "秒"
			sec = $2.to_i
		end
	end
	return Time.mktime(year,month,day,hour,min,sec)
end

def ls_t(path)
	entries = Dir.entries(path)
	entries.reject!{|name| /^\./ =~ name}

	mtimes = Hash.new
	entries = entries.sort_by do |name|
		mtimes[name] = File.mtime(File.join(path,name))
	end

	entries.each do |name|
		printf("%-40s %s\n", name, mtimes[name])
	end
rescue => ex
	puts ex.message
end

require "date"
require "pp"

module Calendar

	module_function

	def cal(year, month)
		first = Date.new(year, month, 1) #月初
		calendar_date = first - first.wday #カレンダーの月初
		end_of_month = ((first >> 1) - 1) #月末

		puts first.strftime("%B %Y").center(21)
		puts " Su Mo Tu We Th Fr St"

		array_sum = Array.new
		while calendar_date < (first >> 1)
			buf = ""
			array = Array.new
			7.times do
				if calendar_date < first || end_of_month < calendar_date
					buf << "   "
					array << "   "
				else
					buf << sprintf("%3d", calendar_date.day)
					array << sprintf("%3d", calendar_date.day)
				end
				calendar_date += 1
			end
			puts buf
			array_sum << array
		end
		pp array_sum
	end
end

def total2(from, to, &block)
	result = 0
	from.upto(to) do |num|
		if block
			result += block.call(num)
		else
			result += num
		end
	end
	return result
end

def counter
	c = 0
	 
	Proc.new do
		c += 1
	end
end

def my_collect(obj, &block)
	buf = []
	
	obj.each do |elem|
		buf << block.call(elem)
	end
	return buf
end

def accumlator
	total = 0
	Proc.new do |x|
		total += x
	end
end




