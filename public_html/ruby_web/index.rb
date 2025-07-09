require 'socket'
require 'json'

PORT = 4560

response_data = {
  main: "localhost:#{PORT}",
  rootDirectory: "public_html/ruby_web/*",
  projects: [
    {
      name: "main",
      port: PORT
    }
  ]
}

server = TCPServer.new('0.0.0.0', PORT)
puts "Listening on http://localhost:#{PORT}"

loop do
  client = server.accept

  request_line = client.gets
  puts request_line

  body = JSON.generate(response_data)
  headers =  "HTTP/1.1 200 OK\r\n" \
             "Content-Type: application/json\r\n" \
             "Content-Length: #{body.bytesize}\r\n" \
             "Connection: close\r\n"

  client.print headers + "\r\n" + body
  client.close
end
