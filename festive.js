// The Christmas ladder (festive mode). DEVELOPMENT LOADER: pulls in one file per tier from festive/.
// For release these files are joined into this one file (see .dev/tools/join_festive.py).
const FESTIVE_TIERS = [];
document.write(['00-peppermint', '01-gumdrop', '02-snowflake', '03-tree', '04-santa', '05-mincepie', '06-gingerbread', '07-pudding', '08-stollen', '09-yulelog', '10-house'].map(f => '<script src="festive/' + f + '.js"><\/script>').join(''));
