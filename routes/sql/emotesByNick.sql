select count(*) as num, "nick" from "Messages" 
where "channel_id" = %PH:CHANNEL_ID% and "command" = 'EMOTE'
group by "nick"
order by num desc;