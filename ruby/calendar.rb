require 'date'
require 'pp'

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
