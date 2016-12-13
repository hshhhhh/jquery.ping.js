# jquery.ping.js

Hey! I will add more few lines one day and bower/composer support. I hope.

This is a library for create funny snippet for you website. It allows you to create progress bar with ping emulation.
Of course I coundn't create real ping request from JS so I'm doing HTTP HEAD request. 
You can find [demo](https://hshhhhh.name/) in top-left corner

## Put it somewhere in your layout template

```javascript
<div id="ping"></div>
<script src="https://raw.githubusercontent.com/hshhhhh/jquery.ping.js/master/jquery.ping.js"></script>
<script>
// Ping
$(function() {
    $('#ping').ping({
        container : $('#ping'),
        endpoint  : 'https://hshhhhh.name/ping',
    })
});
</script>
```
