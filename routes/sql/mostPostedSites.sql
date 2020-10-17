select distinct(domain_name), count(domain_name)
from (
 select substring(text from '.*://([^/]*)') as domain_name 
 from "Messages"
 where channel_id = %PH:CHANNEL_ID% and command = 'PRIVMSG'
) t1
where domain_name is not null
group by domain_name
order by count desc;