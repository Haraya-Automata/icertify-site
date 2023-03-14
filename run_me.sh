# this is a bash script, the shebang line is 
# not needed here so I removed it.

# ask user for input 
while [ true ]; do
    echo "What do you like to do?
    1. Start a new task
    2. Save my task
    3. Show save history"
    read -p "Select an option: " option

    if (( option >= 1 && option <= 3)); then break; fi
    clear
done

# create folder for logging and add it in .gitignore 
mkdir -p "logs"
grep -q "logs/" .gitignore 2>> ./logs/error-logs.txt
if [[ $? -ne 0 ]]; then
    echo "logs/" >> .gitignore
fi

# function to pull latest code from github and create a branch 
# then switch to it
new_task () 
{
    read -p "Enter task name (no spaces): " task
    if [[ "${#task}" -ne  0 ]]; then 
        (git switch -c "feature/${task}" \
            && git pull --rebase origin main) \
                2> ./logs/error-logs.txt \
                > ./logs/output-logs.txt 
                
    else
        clear; new_task
    fi
}

# function to save changes, pull latest code from github then 
# push your changes to github
save_task ()
{
    read -p "Enter what task you've made: " message
    if [[ "${#message}" -ne  0 ]]; then 
        branch=$(git branch --show-current)
        (git switch "$branch" \
            && git add . && git commit -m "$message" \
                && git pull --rebase origin main \
                    && git push -u origin "${branch}") \
                        2> ./logs/error-logs.txt \
                        > ./logs/output-logs.txt 
    else
        clear; save_task
    fi
}

# executes function/command based on what is entered by user
# default option is show the commit history 
case $option in
    1) new_task;;
    2) save_task;;
    *) git log --oneline --graph --decorate --pretty="format: %h: %ar - %s (%an) %d";
esac
   
# check if there's an error encountered while executing git commands
if [[ $? -eq 0 ]]; then
    echo "Success command execution, you may now proceed..."

    if (( option == 2 )); then
        echo "You may now go to the github repository and create a pull request then submit it. Let Just know that you have a pull request."
    fi
else
    echo "Encountered an error, stopping execution. Report it to Just."
fi