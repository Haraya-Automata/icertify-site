# this is a bash script, the shebang line is 
# not needed here so I removed it.

# ask user for input 
while true; do
    echo "What would you like to do?
    1. Get changes
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

# function to delete unused and already pushed branches
(git fetch -p && git branch -a | grep -vE '\*|main|head' | xargs git branch -D) 2>> ./logs/error-logs.txt > ./logs/output-logs.txt 

# function to get latest code changes from github
get_changes () 
{
    (git stash -u && git switch main \
        && git pull --rebase origin main \
            && git stash apply) \
                2> ./logs/error-logs.txt \
                > ./logs/output-logs.txt 
}

# function to save changes, pull latest code from github then 
# push your changes to github
save_task ()
{
    read -p "Enter what task you've made (no spaces): " task
    read -p "Enter message about the task: " message
    if [[ "${#task}" -ne  0 ]]; then 
        (git switch -c "feature/${task}" \
            && git add . && git commit -m "$message" \
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
    1) get_changes;;
    2) save_task;;
    3) git log --graph --abbrev-commit --decorate --format=format:'%C(bold blue)%h%C(reset) - %C(bold green)(%ar)%C(reset) %C(white)%s%C(reset) %C(dim white)- %an%C(reset)%C(auto)%d%C(reset)'
esac

# check if there's an error encountered while executing git commands
if [[ $? -eq 0 ]]; then
    case $option in
        1) echo "Success updating the codebase with latest changes. You may now proceed with your task.";; 
        2) echo "Success saving changes. Tell Just to create a pull request with your task.";;
    esac
else
    echo "Encountered an error, stopping execution. Check error logs and report it to Just."
fi