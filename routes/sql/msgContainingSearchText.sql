select count(*) as num, "nick" from "Messages"
where "channel_id" = %PH:CHANNEL_ID% and "command" = 'PRIVMSG' and "text" ~* %PH:SEARCHTEXT%
group by "nick"
order by num desc;
