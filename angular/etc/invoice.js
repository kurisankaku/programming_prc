angular.module('invoice', ['finance'])
  .controller('InvoiceController', ['currencyConverter', '$location',function(currencyConverter,$location) {
    this.qty = 1;
    this.cost = 2;
    this.path_loc = $location.path();
    this.inCurr = 'EUR';
    this.currencies = currencyConverter.currencies;
    this.total = function total(outCurr) {
      return currencyConverter.convert(this.qty * this.cost, this.inCurr, outCurr);
    };
    this.pay = function pay() {
      window.alert("Thanks!");
    };
  }]);