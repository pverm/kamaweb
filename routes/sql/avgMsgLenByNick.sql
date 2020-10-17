select to_char(avg(length("text")), 'FM999.00') as len, nick from "Messages"
  where "channel_id" = %PH:CHANNEL_ID% and "command" = 'PRIVMSG'
  group by nick
union
select to_char(avg(length("text")), 'FM999.00'), '0total' from "Messages" 
  where "channel_id" = %PH:CHANNEL_ID% and "command" = 'PRIVMSG'
  order by nick desc;