module AlbumsHelper
  
  def leaf arg
    case arg 
      when true : "active" 
      when false: "folder" 
    end 
  end  
  
end
