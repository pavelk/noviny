class Theme < Tag
  
  define_index do
    indexes description
    indexes :name, :sortable => true
  end
  
end
