
#!/bin/bash
#Check if MongoDB is running, if not start it

now=$(date +"%d.%m.%Y %R:%S")
if (( $(ps -ef | grep -v grep | grep mongod | wc -l) > 0 ))
then
echo "$now -  $service is running!!!"
else
#mongod --dbpath /code/cohapp/coherenceanalyzer/mongodb
echo "$now - $service was NOT running, startet it"
echo "$now - Service was not startet due to debug-reasons"
fi
