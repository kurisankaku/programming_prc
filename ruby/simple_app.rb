# coding: utf-8

class SimpleApp
  def call(env)
    p env
    case env['REQUEST_METHOD']
    when 'GET'
      [
        200,
        {'Content-Type' => 'text/html'},
        ['<html><body><form method="POST"><input type="submit" value="見たい？" /></form></body></html>'],
      ]
    when 'POST'
      [
        200,
        {'Content-Type' => 'text/html'},
        ['<html><body>何観てんだよ</body></html>']
      ]
    end
  end
end
