code = ARGV[0]
start_time = Time.now
File.open("KEN_ALL.CSV", "r:shift_jis").each_line do |line|
	line.chomp!
	rows = line.split(/,/)
	zipcode = rows[2].gsub(/"/, '')
	if zipcode == code
		puts line.encode('utf-8')
	end
end
p Time.now - start_time