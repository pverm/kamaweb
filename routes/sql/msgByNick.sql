select COUNT(*) as num, "nick" from "Messages" 
where "channel_id" = %PH:CHANNEL_ID% and "command" = 'PRIVMSG'
group by "nick"
order by num desc;