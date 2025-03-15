
def generate_uid(db):
    """
    Generates the next sequential UID starting from 1.
    Fetches the latest UID from the database and increments it.
    """
    last_entry = db.forms.find_one({}, sort=[("uid", -1)])  
    if last_entry and "uid" in last_entry:
        next_uid = last_entry["uid"] + 1
    else:
        next_uid = 1 

    return next_uid
