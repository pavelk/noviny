require File.dirname(__FILE__) + '/../test_helper'
require 'article_banners_controller'

# Re-raise errors caught by the controller.
class ArticleBannersController; def rescue_action(e) raise e end; end

class ArticleBannersControllerTest < Test::Unit::TestCase
  fixtures :article_banners

  def setup
    @controller = ArticleBannersController.new
    @request    = ActionController::TestRequest.new
    @response   = ActionController::TestResponse.new
  end

  def test_should_get_index
    get :index
    assert_response :success
    assert assigns(:article_banners)
  end

  def test_should_get_new
    get :new
    assert_response :success
  end
  
  def test_should_create_article_banner
    old_count = ArticleBanner.count
    post :create, :article_banner => { }
    assert_equal old_count+1, ArticleBanner.count
    
    assert_redirected_to article_banner_path(assigns(:article_banner))
  end

  def test_should_show_article_banner
    get :show, :id => 1
    assert_response :success
  end

  def test_should_get_edit
    get :edit, :id => 1
    assert_response :success
  end
  
  def test_should_update_article_banner
    put :update, :id => 1, :article_banner => { }
    assert_redirected_to article_banner_path(assigns(:article_banner))
  end
  
  def test_should_destroy_article_banner
    old_count = ArticleBanner.count
    delete :destroy, :id => 1
    assert_equal old_count-1, ArticleBanner.count
    
    assert_redirected_to article_banners_path
  end
end
