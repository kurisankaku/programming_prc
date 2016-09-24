#!/usr/bin/env ruby
require 'webrick'
require 'webrick/httpproxy'
include WEBrick

handler = Proc.new do |req, res|
  if res['content-type'] =~ %r!^text/html/!
    res.body.gsub!("Think IT", "THINK IT!")
  end
end

s = HTTPProxyServer.new({ :Port => 8080,
                          :ProxyContentHandler => handler
                        })
trap("INT"){ s.shutdown }
s.start
