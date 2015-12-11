exports.uriToFilename = uriToFilename;
exports.uriToRelativeFilename = uriToRelativeFilename;
exports.filenameToBaseUri = filenameToBaseUri;
exports.uriAbs = uriAbs;
exports.pathBasename = pathBasename;
exports.uriBase = uriBase;
exports.hasSuffix = hasSuffix;
exports.getResourceLink = getResourceLink;

var fs = require('fs');
var path = require('path');
var S = require('string');

function uriToFilename(uri, base) {
    console.log(uri)
    uri = decodeURIComponent(uri)
    var filename = path.join(base, uri);
    // Make sure filename ends with '/'  if filename exists and is a directory.
    // TODO this sync operation can be avoided and can be left
    // to do, to other components, see `ldp.get`
    try {
        var fileStats = fs.statSync(filename);
        if (fileStats.isDirectory() && !S(filename).endsWith('/')) {
            filename += '/';
        } else if (fileStats.isFile() && S(filename).endsWith('/')) {
            filename = S(filename).chompRight('/').s;
        }
    } catch (err) {}
    return filename;
}

function uriToRelativeFilename(uri, base) {
    var filename = uriToFilename(uri, base);
    var relative = path.relative(base, filename);
    return relative;
}

function filenameToBaseUri(filename, uri, base) {
    var uriPath = S(filename).strip(base).toString();
    return uri + '/' + uriPath;
}

function uriAbs(req) {
    return req.protocol + '://' + req.get('host');
}

function uriBase(req) {
    return uriAbs(req) + (req.baseUrl || '');
}

function pathBasename(fullpath) {
    var bname = '';
    if (fullpath) {
        bname = (fullpath.lastIndexOf('/') === fullpath.length - 1)?'':path.basename(fullpath);
    }
    return bname;
}

function hasSuffix(path, suffixes) {
    for (var i in suffixes) {
        if (path.indexOf(suffixes[i], path.length - suffixes[i].length) !== -1) {
            return true;
        }
    }
    return false;
}

function getResourceLink(filename, uri, base, suffix, otherSuffix) {
    var link = filenameToBaseUri(filename, uri, base);
    if (S(link).endsWith(suffix)) {
        return link;
    } else if (S(link).endsWith(otherSuffix)) {
        return S(link).chompRight(otherSuffix).s + suffix;
    } else {
        return link+suffix;
    }
}