while [ true ]
do 
	# RUNNING="$(ps aux | grep "[n]ode" | wc -l)"
	# if [ $RUNNING = 0 ]; then
		echo "Starting bot..."
		node index.js >> output.log
		echo "Bot has crashed!"
	# fi
	sleep 1;
done
