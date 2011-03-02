function extractIcon(manifest, origin) {
    var iconURL = "../i/openbox.png";
    if (manifest && manifest.icons) {
        if (manifest.icons["128"]) iconURL = manifest.icons["128"];
        else {

        }
    }
    if (iconURL.indexOf("/") === 0) iconURL = origin + iconURL;
    return iconURL;
}

$(document).ready(function() {
    var installed = null;

    $.getJSON( "db/apps.json", function(contents) {
        // whee!  we got our app database.  let's rip through and add all them apps to the
        // directory
        var d = $("#contentWrap");
        d.empty();

        for (var i = 0; i < contents.length; i++) {
            var app = contents[i];
            var e = $("<div />");
            var button = $("<div />").addClass("button").text("Loading...");
            button.appendTo(e);
            var icon = $('<img />');
            icon.attr('src', extractIcon(app.manifest, app.origin));
            icon.appendTo(e);

            // on load error, reset to default icon.
            icon.error(function() {
                $(this).unbind("error").attr("src", extractIcon());
            });
            var name = $("<div />").addClass("name").text(app.manifest.name);
            name.appendTo(e);
            if (app.manifest.developer && app.manifest.developer.name) {
                var attribution = $("<div />").addClass("attribution");
                attribution.append("<span/>").text("by ");
                if (app.manifest.developer.url) {
                    $("<a/>").attr("href", app.manifest.developer.url)
                        .text(app.manifest.developer.name).appendTo(attribution);
                } else {
                    $("<span/>").text(app.manifest.developer.name).appendTo(attribution);
                }
                attribution.appendTo(e);

            }

            function updateStatus(elem) { 
                function checkMe(elem) {
                    var origin = $(elem).attr("origin");
                    for (var i = 0; i < installed.length; i++) {
                        if (origin === installed[i].origin) break;
                    }
                    if (i === installed.length) {
                        $(elem).find(".button").addClass("installable").text("Install")
                            .click(function() {
                                $(elem).find(".button").unbind('click').removeClass("installable").text("Loading...");
                                navigator.apps.install(
                                    {
                                        url: $(elem).attr("appManifestURL"),
                                        onsuccess: function() {
                                            installed = null;
                                            updateStatus(elem);
                                        },
                                        onerror: function(errObj) {
                                          if (errObj.code == "denied") {
                                            // denied doesn't require additional messaging
                                          } else {
                                            alert("Installation did not complete: " + errObj.message);
                                          }
                                          updateStatus(elem);
                                        }
                                    }
                                );
                            });
                    } else {
                        $(elem).find(".button").addClass("installed").text("Installed!")
                    }
                }

                if (installed === null) {
                    navigator.apps.getInstalledBy(function(i) {
                        installed = i;
                        checkMe(elem);
                    });
                } else {
                    checkMe(elem);
                }
            }

            e.hover(function() {
                var self = this;
                $(this).unbind('mouseenter mouseleave');
                updateStatus(self);
           });
            e.attr("appManifestURL", app.src_url);
            e.attr("origin", app.origin);
            e.addClass("singleColumn").appendTo(d);
        }
    });
});
