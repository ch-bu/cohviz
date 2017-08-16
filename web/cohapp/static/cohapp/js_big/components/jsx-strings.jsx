var my_urls = function urls() {

    var container = {};

    container.url =  window.location.href;
    container.url_split = container.url.split('/');

    container.url = window.location.href;
    container.split = container.url.split('/');
    container.website = container.split[0] + '//' + container.split[2];
    container.dashboard = container.website + "/dashboard/";

    // Api endpoints
    container.experiments = container.website + '/apis/experiments/';
    container.measurement = container.website + '/apis/measurements/';
    container.experiment = container.website + '/apis/experiment/';
    container.user_specific = container.website + '/apis/user-specific/';
    container.user_experiment = container.website + '/apis/user-experiment';
    container.user_specific_name = container.website + '/apis/user-specific-name/';
    container.user = container.website + '/apis/user-experiment/';
    container.registration = container.website + '/apis/registration/';
    container.groups = container.website + '/apis/groups/';
    container.textanalyzer = container.website + '/apis/textanalyzer/';
    container.textdata = container.website + '/apis/textdata/';
    container.cognitiveloadrevision = container.webseite + 'apis/cognitiveloadrevision/';
    container.csv_text_data = container.website + '/csv_text_export/';

    container.single_experiment = container.website + '/experiment/';
    container.run_experiment = container.website + '/run-experiment/';

    return container;
}();

export {my_urls};
