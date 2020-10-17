select count(*) as num, "postedAtDate" from "Messages" 
where "channel_id" = %PH:CHANNEL_ID% and "command" = 'PRIVMSG'
group by "postedAtDate"
order by num desc
limit 10;