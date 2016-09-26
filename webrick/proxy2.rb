#!/usr/bin/env ruby
require 'webrick'
require 'webrick/httpproxy'
include WEBrick

class OriginalHTTPProxyServer < HTTPProxyServer
 def proxy_service(req, res)
   localfile = "#{req.host}/#{req.path}" # i1j
   if File.file?(localfile) # i2j
     res.body = open(localfile).read # i3j
     res.header["Content-Type"] = WEBrick::HTTPUtils.mime_type(req.path_info, WEBrick::HTTPUtils::DefaultMimeTypes) # i4j
     return
   end
   super
 end
end

s = OriginalHTTPProxyServer.new({ :Port => 8080 })
trap("INT"){ s.shutdown }
s.start
