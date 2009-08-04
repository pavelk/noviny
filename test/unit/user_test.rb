require File.dirname(__FILE__) + '/../test_helper'

#class UserTest < Test::Unit::TestCase
class UserTest < ActiveSupport::TestCase

  fixtures :users
  
  def test_truth
    assert true
  end
  
end
