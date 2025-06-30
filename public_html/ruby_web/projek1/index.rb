require 'socket'

PORT = 4561

server = TCPServer.new('0.0.0.0', PORT)
puts "Listening on http://localhost:#{PORT}"

loop do
  client = server.accept

  request_line = client.gets
  puts request_line

  body = "Hello World"
  headers =  "HTTP/1.1 200 OK\r\n" \
             "Content-Type: text/plain\r\n" \
             "Content-Length: #{body.bytesize}\r\n" \
             "Connection: close\r\n"

  client.print headers + "\r\n" + body
  client.close
end
