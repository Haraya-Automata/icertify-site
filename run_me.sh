# this is a bash script, the shebang line is 
# not needed here so I removed it.

# ask user for input 
while [ true ]; do
    echo "What do you like to do?
    1. Save my task
    2. Show save history"
    read -p "Select an option: " option

    if (( option >= 1 && option <= 2)); then break; fi
    clear
done

# create folder for logging and add it in .gitignore 
mkdir -p "logs"
grep -q "logs/" .gitignore 2>> ./logs/error-logs.txt
if [[ $? -ne 0 ]]; then
    echo "logs/" >> .gitignore
fi

# function to delete unused and already pushed branches
(git fetch -p && git branch --merged | grep -v '*' \
| grep -v 'main' | xargs git branch -d) 2>> ./logs/error-logs.txt > ./logs/output-logs.txt 

# function to save changes, pull latest code from github then 
# push your changes to github
save_task ()
{
    read -p "Enter what task you've made (no spaces): " task
    read -p "Enter message about the task: " message
    if [[ "${#task}" -ne  0 ]]; then 
        (git switch -c "feature/${task}" \
            && git add . && git commit -m "$message" \
                && git pull --rebase origin main \
                    && git push -u origin "feature/${task}") \
                        2> ./logs/error-logs.txt \
                        > ./logs/output-logs.txt 
    else
        clear; save_task
    fi
}

# executes function/command based on what is entered by user
# default option is to show the commit history 
case $option in
    1) save_task;;
    *) git log --oneline --graph --decorate --pretty="format: %h: %ar - %s (%an) %d"
esac
   
# check if there's an error encountered while executing git commands
if [[ $? -eq 0 ]]; then
    echo "Success command execution, you may now proceed..."

    if (( option == 1 )); then
        echo "Tell Just to create a pull request with your task."
    fi
else
    echo "Encountered an error, stopping execution. Report it to Just."
fi