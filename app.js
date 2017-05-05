angular.module('testApp',[])
.controller("ctrl",function($scope, $timeout, $http){
	var csvObj = {};
	$scope.chartObj = {};
	$scope.$on('generateLinks', function(){
		if($scope.fileContent){
			saveToDataBase();
			showDataLinks();
		}
	});
	$scope.showSeriesChart = function(link){
		// $timeout(function(){
			$scope.chartObj.chartOptions = null;
			$scope.showChart = false;
		// },0)
		var seriesObj = {};
		seriesObj.title = link;
		seriesObj.yearArr = [];
		seriesObj.scoreArr = [];
		angular.forEach(csvObj[link],function(obj,ind){
			seriesObj.yearArr.push(obj['year']);
			seriesObj.scoreArr.push(parseInt(obj['score']));
		})
		
		$timeout(function(){
			$scope.chartObj.chartOptions = returnOptions(seriesObj);	
			$scope.showChart = true;
		},0)
	}

	function returnOptions(seriesObj){
		return {
	        title: {
	            text: ''
	        },
	        xAxis: {
	        	title:{
	        		text:'YEAR'
	        	},
	            categories: seriesObj.yearArr
	        },
	        yAxis: {
	        	title:{
	        		text:'SCORE'
	        	}
	        },
	        series: [{
	        	name: seriesObj.title,
	            data: seriesObj.scoreArr
	        }]
	    };
	    // $scope.$apply();
	}

	function saveToDataBase(){
		angular.forEach($scope.fileContent.split('\n'),function(eachRow, ind){
			var dataArr = [];
			angular.forEach(eachRow.substring(eachRow.indexOf(',')+1).split(','),function(yearScore,ind){
				var obj={}
				obj['year'] = yearScore.split('|')[0];
				obj['score'] = yearScore.split('|')[1];
				dataArr.push(obj);
			})
			csvObj[eachRow.substring(0,eachRow.indexOf(','))] = dataArr;
		});
		console.log("csvObj",csvObj)
		// service call to data base
		$http.post('http://localhost:3030/saveSeriesData', {'jsonData': csvObj}).then(function (data) {
			console.log('data', data);
			alert("Data saved to database!")
		}, function (data) {
			console.log('error', data);
		})
	}

	function showDataLinks(){
		$scope.links = [];
		angular.forEach(csvObj, function(arr, key){
			$scope.links.push(key);
		});
		$scope.$apply();
	}
})
.directive('fileReader', function() {
  return {
    scope: {
      fileReader:"="
    },
    link: function(scope, element) {
		$(element).on('change', function(changeEvent) {
			var files = changeEvent.target.files;
			// Validation for csv files
			if (files.length) {
				var r = new FileReader();
				r.onload = function(e) {
					var contents = e.target.result;
					scope.$apply(function () {
						scope.fileReader = contents;
					});
					scope.$emit('generateLinks');
				};      
				r.readAsText(files[0]);
			} else{
				scope.fileReader = "";
			}
		});
    }
  };
})
.directive('lineChart', function () {
    return {
        restrict: 'E',
        template: '<div></div>',
        scope: {
            options: '='
        },
        link: function (scope, element) {
            Highcharts.chart(element[0], scope.options);
        }
    };
})	