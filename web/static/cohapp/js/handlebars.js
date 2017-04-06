this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["double-text-editor"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function";

  return "<div id=\"editor-double-text\">\n	<div class=\"row\">\n		<div class=\"col s12 m6\">\n			<div class=\"row\" id=\"editor-edit\">"
    + ((stack1 = ((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n			<div class=\"row\" id=\"editor-full-button-div\">\n				<a class=\"waves-effect waves-light btn\" id=\"editor-full-button\">Analyziere meinen Text</a>\n			</div>\n		</div>\n\n		<div id=\"editor-visualize-text\" class=\"col s12 m6\">"
    + ((stack1 = ((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n	</div>\n</div>\n";
},"useData":true});
this["Handlebars"]["templates"]["editor-full"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div id=\"editor-full-wrapper\">\n	<div class=\"row\">\n		<div class=\"col s12 m5\">\n			<div class=\"row\" id=\"editor-full-medium-editor\">"
    + ((stack1 = ((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"text","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "</div>\n			<div class=\"row\" id=\"editor-full-button-div\">\n				<a class=\"waves-effect waves-light btn\" id=\"editor-full-button\">Analyziere meinen Text</a>\n			</div>\n		</div>\n\n		<div id=\"editor-full-graph\" class=\"col s12 m7\"></div>\n	</div>\n</div>\n";
},"useData":true});
this["Handlebars"]["templates"]["editor"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"editor-medium-editor\" class=\"col s11 m10 offset-m1 l8 offset-l2\">\n	<div id=\"editor-textinput\">\n		\n	</div>\n	<div id=\"editor-button-div\" class=\"center-align\">\n		<a class=\"waves-effect waves-light btn\" id=\"editor-button\">Analyziere meinen Text</a>\n	</div>\n</div>";
},"useData":true});
this["Handlebars"]["templates"]["experiment-generator"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "              <option value=\""
    + alias4(((helper = (helper = helpers.abbreviation || (depth0 != null ? depth0.abbreviation : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"abbreviation","hash":{},"data":data}) : helper)))
    + "\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</option>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<form class=\"col s12 m8 offset-m2\" id=\"measurement-form\">\n    <div class=\"row\">\n      <div class=\"col s6 m3 input-field\">\n          <select id=\"form-group\">\n            <option value=\"1\">1</option>\n            <option value=\"2\">2</option>\n            <option value=\"3\">3</option>\n            <option value=\"4\">4</option>\n            <option value=\"5\">5</option>\n          </select>\n          <label>Gruppe</label>\n      </div>\n\n      <div class=\"col s6 m3 input-field\">\n          <input type=\"date\" class=\"datepicker\" id=\"form-date\">\n          <label>Veröffentlichung</label>\n      </div>\n\n      <div class=\"col s6 m3 input-field\">\n          <select id=\"form-treatment\">\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.group : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "          </select>\n          <label>Treatment</label>\n      </div>\n\n      <div class=\"col s6 m3 center-align\">\n        <a id=\"add-measurement\" class=\"btn-floating btn-large waves-effect waves-light green\"><i class=\"material-icons\">add</i></a>\n      </div>\n    </div>\n</form>";
},"useData":true});
this["Handlebars"]["templates"]["experiments"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "			<tr class=\"table-row\" id=\""
    + alias4(((helper = (helper = helpers.master_pw || (depth0 != null ? depth0.master_pw : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"master_pw","hash":{},"data":data}) : helper)))
    + "\">\n				<td>"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.nr_groups || (depth0 != null ? depth0.nr_groups : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nr_groups","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.nr_measurements || (depth0 != null ? depth0.nr_measurements : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nr_measurements","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.date || (depth0 != null ? depth0.date : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"date","hash":{},"data":data}) : helper)))
    + "</td>\n			</tr>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<table class=\"responsive-table highlight\">\n	<thead>\n	  <tr>\n	      <th data-field=\"id\">Experiment</th>\n	      <th data-field=\"name\">Versuchsgruppen</th>\n	      <th data-field=\"price\">Messzeitpunkte</th>\n	      <th data-field=\"price\">Erstellt am</th>\n	  </tr>\n	</thead>\n\n	<tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.experiment : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	</tbody>\n</table>	\n\n";
},"useData":true});
this["Handlebars"]["templates"]["instruction"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div class=\"row\" id=\"instruction\">\n	<div class=\"s12 m8 offset-m2 l8 offset-l2 col\">\n		"
    + ((stack1 = ((helper = (helper = helpers.instruction || (depth0 != null ? depth0.instruction : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"instruction","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n	</div>\n	<div class=\"s12 m8 offset-m2 l5 offset-l3 col center-align\">\n		<a id=\"instruction-read\" class=\"center-align waves-effect waves-light btn\">Ich habe die Instruktion gelesen</a>\n	</div>\n</div>";
},"useData":true});
this["Handlebars"]["templates"]["loading-ring"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"center-align\">\n  <div class=\"preloader-wrapper small active\">\n    <div class=\"spinner-layer spinner-green-only\">\n      <div class=\"circle-clipper left\">\n        <div class=\"circle\"></div>\n      </div><div class=\"gap-patch\">\n        <div class=\"circle\"></div>\n      </div><div class=\"circle-clipper right\">\n        <div class=\"circle\"></div>\n      </div>\n    </div>\n  </div>\n</div>";
},"useData":true});
this["Handlebars"]["templates"]["measurements-table"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "			<tr class=\"table-row\">\n				<td>"
    + alias4(((helper = (helper = helpers.nr_group || (depth0 != null ? depth0.nr_group : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nr_group","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.measure || (depth0 != null ? depth0.measure : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"measure","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.group || (depth0 != null ? depth0.group : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"group","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.publication || (depth0 != null ? depth0.publication : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"publication","hash":{},"data":data}) : helper)))
    + "</td>\n			</tr>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<table class=\"responsive-table highlight\">\n	<thead>\n	  <tr>\n	      <th data-field=\"id\">Gruppe</th>\n	      <th data-field=\"name\">Messzeitpunkt</th>\n	      <th data-field=\"price\">Treatment</th>\n	      <th data-field=\"price\">Veröffentlichung</th>\n	  </tr>\n	</thead>\n\n	<tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.measurement : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	</tbody>\n</table>	\n\n";
},"useData":true});
this["Handlebars"]["templates"]["modal-help"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div id=\"modal-help\" class=\"modal\">\n  <div class=\"modal-content\">\n    "
    + ((stack1 = ((helper = (helper = helpers.instruction || (depth0 != null ? depth0.instruction : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"instruction","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n  </div>\n  <div class=\"modal-footer\">\n    <a class=\" modal-action modal-close waves-effect waves-green btn-flat\">Verstanden.</a>\n  </div>\n</div>\n          ";
},"useData":true});
this["Handlebars"]["templates"]["modal-revision"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper;

  return "<div id=\"modal-revision\" class=\"modal\">\n  <div class=\"modal-content\">\n    "
    + ((stack1 = ((helper = (helper = helpers.instruction || (depth0 != null ? depth0.instruction : depth0)) != null ? helper : helpers.helperMissing),(typeof helper === "function" ? helper.call(depth0 != null ? depth0 : {},{"name":"instruction","hash":{},"data":data}) : helper))) != null ? stack1 : "")
    + "\n  </div>\n  <div class=\"modal-footer\">\n    <a class=\" modal-action modal-close waves-effect waves-green btn-flat\">Verstanden.</a>\n  </div>\n</div>\n          ";
},"useData":true});
this["Handlebars"]["templates"]["modal_instruction"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div id=\"modal-instruction\" class=\"modal\">\n  <div class=\"modal-content\">\n    <h4>Wie es funktioniert</h4>\n    <p>Auf der linken Seite siehst du den Text, den du gerade geschrieben hast. Auf der rechten Seite siehst du eine grafische Darstellung deines Textes.</p>\n    <p>Die grafische Darstellung setzt sich aus den Nomen deines Textes zusammen. Du kannst die Darstellung genauer ansehen, indem du mit der Maus hineinzoomst.</p>\n    <p>Nomen, die du in einem Satz verwendet hast, werden mit Strichen miteinander verbunden. Manche Nomen bilden manchmal sogenannte Cluster. Wenn du mehr als ein Cluster in deinem Text hast, ist dein Text nicht vollständig kohärent. Versuche den Text in diesem Fall so umzuschreiben, dass du alle Nomen in einem Cluster miteinander verbindest.</p>\n  </div>\n  <div class=\"modal-footer\">\n    <a href=\"#!\" class=\" modal-action modal-close waves-effect waves-green btn-flat\">Verstanden.</a>\n  </div>\n</div>\n          ";
},"useData":true});
this["Handlebars"]["templates"]["test"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<div class=\"progress col s12 m8 offset-m2\">\n  <div class=\"indeterminate\"></div>\n</div>";
},"useData":true});
this["Handlebars"]["templates"]["text_analyze_button"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<a class=\"waves-effect waves-light btn\" id=\"editor-button\">Analyziere Text</a>";
},"useData":true});
this["Handlebars"]["templates"]["text_analyze_button_full"] = Handlebars.template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    return "<a class=\"waves-effect waves-light btn\" id=\"editor-full-button\">Analyziere Text</a>";
},"useData":true});
this["Handlebars"]["templates"]["users"] = Handlebars.template({"1":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "			<tr class=\"table-row\">\n				<td>"
    + alias4(((helper = (helper = helpers.user || (depth0 != null ? depth0.user : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"user","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.group || (depth0 != null ? depth0.group : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"group","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.last_login || (depth0 != null ? depth0.last_login : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"last_login","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.nr_measurements || (depth0 != null ? depth0.nr_measurements : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"nr_measurements","hash":{},"data":data}) : helper)))
    + "</td>\n				<td>"
    + alias4(((helper = (helper = helpers.next_measure || (depth0 != null ? depth0.next_measure : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"next_measure","hash":{},"data":data}) : helper)))
    + "</td>\n			</tr>\n";
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1;

  return "<table class=\"responsive-table highlight\">\n	<thead>\n	  <tr>\n	      <th data-field=\"id\">Person</th>\n	      <th data-field=\"name\">Gruppe</th>\n	      <th data-field=\"price\">Letzter Login</th>\n	      <th data-field=\"price\">Messzeitpunkte</th>\n	      <th data-field=\"price\">Nächster Messzeitpunkt</th>\n	  </tr>\n	</thead>\n\n	<tbody>\n"
    + ((stack1 = helpers.each.call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.user : depth0),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "	</tbody>\n</table>	\n\n";
},"useData":true});
//# sourceMappingURL=handlebars.js.map
