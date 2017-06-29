require 'csv'

csv_data = CSV.read(ARGV[0], headers: true, col_sep: "\t")
File.open(ARGV[1], ARGV[2] || "w") do |file|
  csv_data.each do |data|
    next if data["drugid"] == "" || data["drugid"] == nil
    sql = "insert into wch_gout_drug_info(drug_id,drug_type_name,drug_name,common_name,otc,form,company_name,indication,dosage) values(#{data["drugid"]},'#{data["drugTypeName"]}','#{data["drugName"]}','#{data["commonName"]}',#{data["OTC"]},'#{data["form"]}','#{data["companyName"]}','#{data["indication"]}','#{data["dosage"]}');\n"
    file.write(sql)
  end
end

