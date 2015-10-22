module Sample
  def hoge
    p "hoge"
  end
end

class Test
  include Sample

  def hoge1
    p "test"
    hoge
  end
end

Test.new.hoge1
