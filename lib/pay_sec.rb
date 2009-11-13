require "soap/wsdlDriver"
require 'soap/rpc/driver'
require 'soap/header/simplehandler' 
OpenSSL::SSL::VERIFY_PEER = OpenSSL::SSL::VERIFY_NONE

class PaySec
    WSDL_URL = "https://mapi.paysec.cz/?wsdl"
    TEST_WSDL_URL = "https://testgateway.paysec.csob.cz/testgateway/ShoppingService.wsdl"
    RPC_URL = "https://testgateway.paysec.csob.cz/testgateway/shoppingservice.svc?wsdl"
    NAMESPACE = "http://schemas.mapi.paysec.cz/2008/02"
    ACTION = "http://schemas.mapi.paysec.cz/2008/02/ShoppingService/VerifyTransactionIsPaid"
    
    MAPI_USER_NAME = "denikreferendum"
    MAPI_PASSWORD = "MapForYou04"
    
    TEST_MAPI_USER_NAME = "Pay8762314"
    TEST_MAPI_PASSWORD = "8yW2Wgq"
    TEST_MICRO_ACCOUNT_NUMBER = 8762314
    
    attr_reader :result_code
=begin
      @user = TEST_MAPI_USER_NAME
      @pass = TEST_MAPI_PASSWORD
      @driver = SOAP::RPC::Driver.new(RPC_URL,NAMESPACE)
      
      @driver.options['protocol.http.ssl_config.ca_file'] = "#{RAILS_ROOT}/public/wsdl/testgateway.paysec.csob.cz.crt"
      @driver.options['protocol.http.ssl_config.client_cert'] = "#{RAILS_ROOT}/public/wsdl/testgateway.paysec.csob.cz.crt"
      
      
      @driver.options['protocol.http.ssl_config.ca_file'] = "#{RAILS_ROOT}/public/wsdl/tca.cer"
      @driver.options['protocol.http.ssl_config.ca_file'] = "#{RAILS_ROOT}/public/wsdl/RootCERT_NewSica.cer"
      
      @driver.options['protocol.http.ssl_config.client_cert'] = "#{RAILS_ROOT}/public/wsdl/tca.cer"
      @driver.options['protocol.http.ssl_config.client_cert'] = "#{RAILS_ROOT}/public/wsdl/RootCERT_NewSica.cer"
      
      @driver.options[ "protocol.http.ssl_config.verify_mode" ] = OpenSSL::SSL::VERIFY_NONE
      
       # Add remote sevice methods
      @driver.add_method_with_soapaction("VerifyTransactionIsPaid",
        ACTION, "userName","password","merchantOrderId","amount")
      return
=end    
    def initialize(options={})
      if options[:test]
        @driver = SOAP::WSDLDriverFactory.new(TEST_WSDL_URL).create_rpc_driver
        @user = TEST_MAPI_USER_NAME
        @pass = TEST_MAPI_PASSWORD
      else
        @driver = SOAP::WSDLDriverFactory.new(WSDL_URL).create_rpc_driver
        @user = MAPI_USER_NAME
        @pass = MAPI_PASSWORD
      end
    end
    
    def VerifyTransactionIsPaid(merchantOrderId,amount)
      @result_code = @driver.VerifyTransactionIsPaid(@user,@pass,merchantOrderId,amount)
      return @result_code
    end
    
    def success?
      @result_code == "0"
    end
    
    def customer_info
      case @result_code
        when "0"
          return "Platba prostřednictvím systému PaySec proběhla úspěšně"
        when "1"
          return "Platbu se nepodařilo zrealizovat."
        when "2"
          return "Stav platby se nepodařilo ověřit. Pracujeme na nápravě."
        when "3"
          return "Stav platby se nepodařilo ověřit. Pracujeme na nápravě."
        when "4"
          return "Stav platby se nepodařilo ověřit. Pracujeme na nápravě."
        when "5"
          return "Platbu se nepodařilo zrealizovat."
        when "6"
          return "Stav platby se nepodařilo ověřit. Pracujeme na nápravě."
        when "-"
          return "Stav platby se nepodařilo ověřit. Pracujeme na nápravě."
      end  
    end
  
    def admin_info
      case @result_code
        when "0"
          return "Transakce byla úspěšně zaúčtována."
        when "1"
          return "Transakce byla zamítnuta."
        when "2"
          return "Přihlašovací jméno či heslo není platné nebo přihlašovací jméno neexistuje."
        when "3"
          return "Konto je blokováno nebo zrušeno."
        when "4"
          return "Transakce s daným číslem objednávky (MerchantOrderId) neexistuje."
        when "5"
          return "Zadaná částka neodpovídá transakci."
        when "6"
          return "Systémová chyba (kontaktujte podporu)."
        when "-"
          return "Webová služba je nedostupná"
      end  
    end
    
end
          