function Database($scope) {
	//new PostingController();
	PouchDB.DEBUG = true;
	var db = 'ppnet_suelz';

	$scope.db = new PouchDB(db, {
		debug: true,
		auto_compaction: true
	});
	//$scope.db = new PouchDB('ppnet');

	$scope.remoteCouch = 'http://localhost:5984/' + db;

	// Function for continuous sync

	$scope.sync = function() {
		console.log('sync');
		var opts = {
			continuous: true,
			include_docs: true
		};
		$scope.db.replicate.from($scope.remoteCouch, opts);
	};


	// Inital Replication from remote to local (data-subset: only POSTs not older than 24hours)
	var initialReplicateFrom = function(time) {
		console.log('START: initialReplicateFrom (' + time + ')');
		var args = {
			complete: function() {
				console.log('FINISH: initialReplicateFrom (' + time + ') args');
				//initialReplicateFromOld(time);
			},
			onChange: function(change) {},
			filter: function(doc, req) {
				var oldest_timestamp = time - (86400 * 1000);

				//if (doc.created > oldest_timestamp && doc.type && doc.type == "POST") {
				if (doc.created > oldest_timestamp) {
					return true;
				} else {
					return false;
				}

			}
		};
		$scope.db.replicate.from($scope.remoteCouch, args);
	};

	if ($scope.remoteCouch) {
		$scope.sync();
		initialReplicateFrom(new Date().getTime());
	}
	Offline.on('up', function() {
		$scope.sync();
		initialReplicateFrom(new Date().getTime());
	}, '');
}
